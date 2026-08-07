import struct
import json

def parse_glb(file_path):
    with open(file_path, 'rb') as f:
        magic = f.read(4)
        version, length = struct.unpack('<II', f.read(8))
        chunk_len, chunk_type = struct.unpack('<II', f.read(8))
        json_data = f.read(chunk_len).decode('utf-8')
        gltf = json.loads(json_data)
        chunk_len, chunk_type = struct.unpack('<II', f.read(8))
        bin_data = f.read(chunk_len)
        
    prim = gltf['meshes'][0]['primitives'][0]
    attrs = prim['attributes']
    pos_acc = gltf['accessors'][attrs['POSITION']]
    pos_bv = gltf['bufferViews'][pos_acc['bufferView']]
    pos_offset = pos_bv.get('byteOffset', 0) + pos_acc.get('byteOffset', 0)
    pos_stride = pos_bv.get('byteStride', 12)
    count = pos_acc['count']
    
    uv_acc = gltf['accessors'][attrs['TEXCOORD_0']]
    uv_bv = gltf['bufferViews'][uv_acc['bufferView']]
    uv_offset = uv_bv.get('byteOffset', 0) + uv_acc.get('byteOffset', 0)
    uv_stride = uv_bv.get('byteStride', 8)
    
    norm_acc = gltf['accessors'][attrs['NORMAL']]
    norm_bv = gltf['bufferViews'][norm_acc['bufferView']]
    norm_offset = norm_bv.get('byteOffset', 0) + norm_acc.get('byteOffset', 0)
    norm_stride = norm_bv.get('byteStride', 12)
    
    back_us = []
    for i in range(count):
        n_pos = norm_offset + i * norm_stride
        nx, ny, nz = struct.unpack_from('<fff', bin_data, n_pos)
        
        uv_pos = uv_offset + i * uv_stride
        u, v = struct.unpack_from('<ff', bin_data, uv_pos)
        
        p_pos = pos_offset + i * pos_stride
        x, y, z = struct.unpack_from('<fff', bin_data, p_pos)
        
        if nz < -0.8: # strong backward normal
            back_us.append((u, v, x, y, z))
            
    print(f"Strong back-facing vertices count: {len(back_us)}")
    print(f"Min U: {min(u for u,v,x,y,z in back_us):.4f}, Max U: {max(u for u,v,x,y,z in back_us):.4f}")
    
    # Print the U values in ranges
    ranges = [0] * 10
    for u, v, x, y, z in back_us:
        idx = min(9, int(u * 10))
        ranges[idx] += 1
    for r_idx, val in enumerate(ranges):
        print(f"  U in [{r_idx/10:.1f}, {(r_idx+1)/10:.1f}]: {val}")

parse_glb('scratch/tag.glb')
